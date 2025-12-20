
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/votingAngular/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "preload": [
      "chunk-OI3ZFKEL.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-GTVPW7LC.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/dashboard"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-JGTBJLHX.js",
      "chunk-2EMSZK5A.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/step1"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-TZZQDLFB.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/step2"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-7KX55NMQ.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/step3"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-QNEB73AG.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/step4"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-EG5NZLR5.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/step5"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-QPMQVAZK.js",
      "chunk-2EMSZK5A.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/registerEmployee"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-7WS4XLPE.js",
      "chunk-2EMSZK5A.js",
      "chunk-ISMGKKBJ.js"
    ],
    "route": "/adminLogin"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 34816, hash: '65e765fda5a499ea13615f7776e9fcbf88a603abe2696265b28ef995989b2a41', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 16713, hash: '14b97305604a5cb725d7bc84efe71085b67d8a27a1dd69a96845bcf81797b02c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'step3/index.html': {size: 52860, hash: '9c297143e54b8c6f26098e914fca67e656b2f66b121d3ee26ff596d9e43e609a', text: () => import('./assets-chunks/step3_index_html.mjs').then(m => m.default)},
    'index.html': {size: 51347, hash: 'a5d0513f13a3a80dfd216722188639c54470ae5d8dc5fda4a283e9bea404bf9d', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 56945, hash: 'da89c934321d18b738ca7af2339997ee948da9638e80e4c0af54ca82f50326f9', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)},
    'step4/index.html': {size: 52891, hash: 'e5e67978c128b6bcdab43e53bc983f27acfe7a41cf1813d50be9a7d37d2abb35', text: () => import('./assets-chunks/step4_index_html.mjs').then(m => m.default)},
    'step1/index.html': {size: 51013, hash: '0dff92d6af67efa8d5eda064d4d92493c2a0519ed6e94f298d68d326a61159c4', text: () => import('./assets-chunks/step1_index_html.mjs').then(m => m.default)},
    'registerEmployee/index.html': {size: 58020, hash: '9180e62c0a22df2de5da7518e4f697c7ea5d03c639209a91dd17c05961a0427d', text: () => import('./assets-chunks/registerEmployee_index_html.mjs').then(m => m.default)},
    'adminLogin/index.html': {size: 51199, hash: 'fa980d3c00c4acdf415b6a4bb22aeb074c633357f16d0aea20a4c869855b220f', text: () => import('./assets-chunks/adminLogin_index_html.mjs').then(m => m.default)},
    'step5/index.html': {size: 48984, hash: '021e935ea4998e9ed6db83dee7855e70529312bf61401a80247ab8e7580049c6', text: () => import('./assets-chunks/step5_index_html.mjs').then(m => m.default)},
    'step2/index.html': {size: 50460, hash: 'eb7e7b4f44ecdcbd103497c1b40db33a9c41bb452d21429fe522180e7f395d33', text: () => import('./assets-chunks/step2_index_html.mjs').then(m => m.default)},
    'styles-MCDUBAMU.css': {size: 53254, hash: '85HIOwRD0aA', text: () => import('./assets-chunks/styles-MCDUBAMU_css.mjs').then(m => m.default)}
  },
};
