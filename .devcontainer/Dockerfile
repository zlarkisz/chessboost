FROM node:24

RUN apt-get update && apt-get install -y --no-install-recommends \
    iptables ipset iproute2 dnsutils jq aggregate sudo \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g @anthropic-ai/claude-code

COPY init-firewall.sh /usr/local/bin/init-firewall.sh

RUN chmod 755 /usr/local/bin/init-firewall.sh \
  && echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-firewall \
  && chmod 0440 /etc/sudoers.d/node-firewall

USER node

RUN mkdir -p /home/node/.claude