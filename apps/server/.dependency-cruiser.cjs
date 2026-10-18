/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-nestjs',
      severity: 'error',
      comment: 'domain/ must not import @nestjs/* — plain classes and types only.',
      from: { path: '^src/[^/]+/domain/' },
      to: { path: '(^|/)@nestjs/' },
    },
    {
      name: 'domain-no-external',
      severity: 'error',
      comment: 'domain/ must not depend on npm packages or Node built-ins.',
      from: { path: '^src/[^/]+/domain/' },
      to: {
        dependencyTypes: [
          'npm',
          'npm-dev',
          'npm-optional',
          'npm-peer',
          'npm-bundled',
          'npm-no-pkg',
          'npm-unknown',
          'core',
        ],
      },
    },
    {
      name: 'domain-no-unresolvable',
      severity: 'error',
      comment: 'domain/ imports must resolve inside the repo (catches uninstalled packages).',
      from: { path: '^src/[^/]+/domain/' },
      to: { couldNotResolve: true },
    },
    {
      name: 'domain-only-own-domain',
      severity: 'error',
      comment: 'domain/ may import only its own domain/ (no other layers, no shared/).',
      from: { path: '^src/([^/]+)/domain/' },
      to: { path: '^src/', pathNot: '^src/$1/domain/' },
    },
    {
      name: 'application-no-outer-layers',
      severity: 'error',
      comment: 'application/ depends on domain/ and shared/events only.',
      from: { path: '^src/([^/]+)/application/' },
      to: { path: '^src/($1/(infrastructure|presentation)/|infrastructure/)' },
    },
    {
      name: 'application-only-shared-events',
      severity: 'error',
      comment: 'application/ may import from shared/ only shared/events.',
      from: { path: '^src/[^/]+/application/' },
      to: { path: '^src/shared/', pathNot: '^src/shared/events/' },
    },
    {
      name: 'presentation-via-application',
      severity: 'error',
      comment: 'presentation/ goes through application/, not infrastructure/ or shared/.',
      from: { path: '^src/([^/]+)/presentation/' },
      to: { path: '^src/($1/infrastructure/|infrastructure/|shared/)' },
    },
    {
      name: 'no-cross-bc',
      severity: 'error',
      comment: 'Bounded contexts talk only via shared/events — no direct imports.',
      from: { path: '^src/([^/]+)/', pathNot: '^src/(shared|infrastructure)/' },
      to: { path: '^src/[^/]+/', pathNot: '^src/($1|shared|infrastructure)/' },
    },
    {
      name: 'infrastructure-no-bc',
      severity: 'error',
      comment: 'src/infrastructure/ is shared plumbing and must not import any bounded context.',
      from: { path: '^src/infrastructure/' },
      to: { path: '^src/[^/]+/', pathNot: '^src/(infrastructure|shared)/' },
    },
    {
      name: 'shared-no-bc',
      severity: 'error',
      comment: 'shared/ must not import any bounded context.',
      from: { path: '^src/shared/' },
      to: { path: '^src/', pathNot: '^src/shared/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: ['\\.d\\.ts$', '^src/main\\.ts$', '(^|/)\\.[^/]+\\.(c|m)?js$'],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      extensions: ['.ts', '.js', '.json'],
    },
  },
};
