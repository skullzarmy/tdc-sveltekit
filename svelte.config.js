import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter(),
    target: '#svelte'
  }
};

const config = {
  kit: {
    adapter: adapter(),
    methodOverride: {
      allowed: ['PATCH', 'DELETE'],
    },
  },
};

export default config;
