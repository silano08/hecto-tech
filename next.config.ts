import nextra from "nextra";

const withNextra = nextra({
  mdxOptions: {
    rehypePrettyCodeOptions: {
      theme: 'github-dark',
    },
  },
})

export default withNextra({

})