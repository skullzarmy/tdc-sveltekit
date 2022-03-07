import adapter from "@sveltejs/adapter-netlify";

export default {
    kit: {
        adapter: adapter(),
        methodOverride: {
            allowed: ["PATCH", "DELETE"],
        },
    },
};
