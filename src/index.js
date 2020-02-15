const admin = require("./config/firebase");
require("dotenv").config();

const {
  ApolloServer,
  ApolloError,
  ValidationError,
  gql
} = require("apollo-server");

const typeDefs = gql`
  # Queries
  type Query {
    user(id: String!): User
    users: [User]
    post(id: String!): Posts
    posts: [Posts]
    comment(id: String!): Comments
    comments: [Comments]
  }
  # A User Object
  type User {
    id: ID!
    email: String!
    username: String!
    img_url: String
    posts: [Posts!]
  }
  # A Post Object
  type Posts {
    id: ID!
    title: String!
    body: String!
    user_id: String!
    user: User!
    comments: [Comments!]
  }
  # A Comments Object
  type Comments {
    id: ID!
    body: String!
    user_id: String!
    user: User!
    post_id: String!
    post: User!
  }

  # Mutations
  type Mutation {
    addUser(creds: UserCreds!): User!
    addPost(creds: PostCreds!): Posts!
    addComment(creds: CommentCreds!): Comments!
    updateUser(creds: UserCreds!): User!
    updatePost(creds: PostCreds!): Posts!
    updateComment(creds: CommentCreds!): Comments!
    deleteUser(id: ID!): String!
    deletePost(id: ID!): String!
    deleteComment(id: ID!): String!
  }
  input UserCreds {
    id: ID!
    email: String!
    username: String!
    img_url: String
  }
  input PostCreds {
    id: ID!
    title: String!
    body: String!
    user_id: String!
  }
  input CommentCreds {
    id: ID!
    body: String!
    user_id: String!
    post_id: String!
  }
  input DeleteResponse {
    response: String!
  }
`;

const resolvers = {
  Query: {
    async user(_, args) {
      try {
        const userDoc = await admin
          .firestore()
          .doc(`users/${args.id}`)
          .get();
        const user = userDoc.data();
        return user || new ValidationError("User ID not found");
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async users() {
      const users = await admin
        .firestore()
        .collection("users")
        .get();
      return users.docs.map(user => user.data());
    },
    async post(_, args) {
      try {
        const postDoc = await admin
          .firestore()
          .doc(`posts/${args.id}`)
          .get();
        const post = postDoc.data();
        return post || new ValidationError("Post ID not found");
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async posts() {
      const posts = await admin
        .firestore()
        .collection("posts")
        .get();
      return posts.docs.map(post => post.data());
    },
    async comment(_, args) {
      try {
        const postDoc = await admin
          .firestore()
          .doc(`comments/${args.id}`)
          .get();
        const post = postDoc.data();
        return post || new ValidationError("Comment ID not found");
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async comments() {
      const posts = await admin
        .firestore()
        .collection("comments")
        .get();
      return posts.docs.map(post => post.data());
    }
  },
  User: {
    async posts(user) {
      try {
        const userPost = await admin
          .firestore()
          .collection("posts")
          .where("user_id", "==", user.id)
          .get();
        return userPost.docs.map(post => post.data());
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  Posts: {
    async user(post) {
      try {
        const postAuthor = await admin
          .firestore()
          .doc(`users/${post.user_id}`)
          .get();
        return postAuthor.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async comments(post) {
      try {
        const postComments = await admin
          .firestore()
          .collection("comments")
          .where("post_id", "==", post.id)
          .get();
        return postComments.docs.map(post => post.data());
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  Comments: {
    async user(comment) {
      try {
        const commentAuthor = await admin
          .firestore()
          .doc(`users/${comment.user_id}`)
          .get();
        return commentAuthor.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async post(comment) {
      try {
        const postsComment = await admin
          .firestore()
          .doc(`users/${comment.post_id}`)
          .get();
        return postsComment.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  Mutation: {
    addUser: async (_, { creds: { id, email, username, img_url } }) => {
      try {
        await admin
          .firestore()
          .collection("users")
          .doc(id)
          .set({
            id: id,
            email: email,
            username: username,
            img_url: img_url
          });
        const new_user = await admin
          .firestore()
          .doc(`users/${id}`)
          .get();
        return new_user.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    addPost: async (_, { creds: { id, title, body, user_id } }) => {
      try {
        await admin
          .firestore()
          .collection("posts")
          .doc(id)
          .set({
            id: id,
            title: title,
            body: body,
            user_id: user_id
          });
        const new_post = await admin
          .firestore()
          .doc(`posts/${id}`)
          .get();
        return new_post.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    addComment: async (_, { creds: { id, body, user_id, post_id } }) => {
      try {
        await admin
          .firestore()
          .collection("comments")
          .doc(id)
          .set({
            id: id,
            body: body,
            user_id: user_id,
            post_id: post_id
          });
        const new_comment = await admin
          .firestore()
          .doc(`comments/${id}`)
          .get();
        return new_comment.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: process.env.ENGINE_API_KEY
  },
  introspection: true
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
