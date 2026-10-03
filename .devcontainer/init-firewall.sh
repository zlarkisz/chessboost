#!/bin/bash
set -euo pipefail

ALLOWED_DOMAINS=(
  api.anthropic.com
  claude.ai
  claude.com
  platform.claude.com
  registry.npmjs.org
)

# 1. Clean slate
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT
iptables -F
iptables -X
ipset destroy allowed-domains 2>/dev/null || true

# 2. Baseline: localhost, DNS, replies to already-allowed connections
iptables -A INPUT  -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT
iptables -A INPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 3. Allowed IP set
ipset create allowed-domains hash:net

gh_meta=$(curl -fsS --max-time 10 https://api.github.com/meta)
while read -r cidr; do
  ipset add allowed-domains "$cidr"
done < <(echo "$gh_meta" | jq -r '(.web + .api + .git)[]' | grep -v ':' | aggregate -q)
echo "GitHub: $(ipset list allowed-domains | grep -c '/') ranges"

for domain in "${ALLOWED_DOMAINS[@]}"; do
  ips=$(dig +noall +answer A "$domain" | awk '$4 == "A" {print $5}' || true)
  if [ -z "$ips" ]; then
    echo "ERROR: failed to resolve $domain"
    exit 1
  fi
  while read -r ip; do
    ipset add -exist allowed-domains "$ip"
  done <<< "$ips"
  echo "$domain: $(echo "$ips" | wc -l) IP"
done

# 4. Docker host network
HOST_IP=$(ip route | awk '/default/ {print $3}' || true)
if [ -z "$HOST_IP" ]; then
  echo "ERROR: failed to detect host IP"
  exit 1
fi
HOST_NETWORK="${HOST_IP%.*}.0/24"
iptables -A INPUT  -s "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT

# 5. Whitelist + deny everything else
iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT
iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# 6. Block IPv6 entirely (except localhost)
if ip6tables -L >/dev/null 2>&1; then
  ip6tables -F
  ip6tables -A INPUT  -i lo -j ACCEPT
  ip6tables -A OUTPUT -o lo -j ACCEPT
  ip6tables -P INPUT DROP
  ip6tables -P FORWARD DROP
  ip6tables -P OUTPUT DROP
fi

# 7. Self-check
if curl -s --connect-timeout 5 https://example.com >/dev/null; then
  echo "ERROR: example.com is reachable - firewall is not working"
  exit 1
fi
echo "OK: example.com is blocked"

if ! curl -s --connect-timeout 5 -o /dev/null https://api.anthropic.com; then
  echo "ERROR: api.anthropic.com is unreachable"
  exit 1
fi
echo "OK: api.anthropic.com is reachable"