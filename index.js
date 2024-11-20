import { htmlToLexical } from "@tryghost/kg-html-to-lexical";
import fs from "fs/promises";

try {
  const postsPath = process.argv[2];
  const usersPath = process.argv[3];

  if (!postsPath) {
    console.error("Please provide a file path as an argument");
    process.exit(1);
  }

  if (!usersPath) {
    console.error("Please provide a users file path as an argument");
    process.exit(1);
  }

  const fileContent = await fs.readFile(postsPath, "utf-8");
  /**
   * @type {Array<{
   *  title: string,
   *  slug: string,
   *  author: string,
   *  summary: string,
   *  body: string,
   *  status: string,
   *  published: string,
   *  tags: string,
   *  categories: string,
   *  seo_title: string,
   *  meta_description: string,
   *  featured_image: string,
   * }>}
   */
  const jsonData = JSON.parse(fileContent);

  const usersFileContent = await fs.readFile(usersPath, "utf-8");
  /**
   * @type {Array<{
   *  name: string,
   *  email: string,
   *  bio: string,
   *  website: string | null,
   * }>}
   */
  const usersData = JSON.parse(usersFileContent);

  /**
   * @type {Array<{
   *  id: number,
   *  name: string,
   *  email: string,
   *  profile_image: string | null,
   *  cover_image: string | null,
   *  bio: string | null,
   *  website: string | null,
   *  location: string | null,
   *  accessibility: string | null,
   *  meta_title: string | null,
   *  meta_description: string | null,
   *  created_at: number,
   *  created_by: number,
   *  updated_at: number,
   *  updated_by: number,
   * }>}
   */
  const users = [];
  for (const user of usersData) {
    users.push({
      id: users.length + 2, // 1 is already taken by the init user of ghost
      name: user.name,
      email: user.email,
      profile_image: null,
      cover_image: null,
      bio: user.bio,
      website: user.website,
      location: null,
      accessibility: null,
      meta_title: null,
      meta_description: null,
      created_at: Date.now(),
      created_by: 1,
      updated_at: Date.now(),
      updated_by: 1,
    });
  }

  /**
   * @type {Array<{
   *  id: number,
   *  title: string,
   *  slug: string,
   *  lexical: string,
   *  feature_image: string | null,
   *  feature_image_alt: string | null,
   *  feature_image_caption: string | null,
   *  featured: number,
   *  page: number,
   *  status: string,
   *  published_at: number,
   *  published_by: number,
   *  meta_title: string | null,
   *  meta_description: string | null,
   *  email_only: boolean,
   *  author_id: number,
   *  created_at: number,
   *  created_by: number,
   *  updated_at: number,
   *  updated_by: number,
   * }>}
   */
  const posts = [];
  for (const post of jsonData) {
    const lexicalData = htmlToLexical(post.body);
    const author = users.find((user) => user.email === post.author);

    posts.push({
      id: posts.length + 1,
      title: post.title,
      slug: post.slug,
      lexical: JSON.stringify(lexicalData),
      feature_image: post.featured_image,
      feature_image_alt: null,
      feature_image_caption: null,
      featured: 0,
      page: 0,
      published_at: post.published,
      published_by: author.id,
      meta_title: post.seo_title,
      meta_description: post.meta_description,
      email_only: false,
      author_id: author.id,
      created_at: post.published,
      created_by: author.id,
      updated_at: post.published, // butter doesnt give us this,
      status: post.status,
      updated_by: author.id,
    });
  }

  await fs.writeFile(
    "export.json",
    JSON.stringify(
      {
        meta: {
          exported_on: Date.now(),
          version: "5.94.1",
        },
        data: {
          posts,
          tags: [],
          posts_tags: [],
          users,
          roles_users: [],
        },
      },
      null,
      2
    )
  );
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
