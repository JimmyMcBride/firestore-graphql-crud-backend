const express = require("express");
const admin = require("./config/firebase");

const {
  ApolloServer,
  ApolloError,
  ValidationError,
  gql
} = require("apollo-server-express");

const app = express();

require("dotenv").config();

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
    deleteUser(id: ID!): DeleteResponse!
    deletePost(id: ID!): DeleteResponse!
    deleteComment(id: ID!): DeleteResponse!
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
  type DeleteResponse {
    response: String!
  }
`;

const resolvers = {
  Query: {
    async user(_, { id }) {
      try {
        const userDoc = await admin
          .firestore()
          .doc(`users/${id}`)
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
    async post(_, { id }) {
      try {
        const postDoc = await admin
          .firestore()
          .doc(`posts/${id}`)
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
    async comment(_, { id }) {
      try {
        const postDoc = await admin
          .firestore()
          .doc(`comments/${id}`)
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
    },
    updateUser: async (_, { creds: { id, email, username, img_url } }) => {
      try {
        await admin
          .firestore()
          .doc(`users/${id}`)
          .set({
            id: id,
            email: email,
            username: username,
            img_url: img_url
          });
        const updated_user = await admin
          .firestore()
          .doc(`users/${id}`)
          .get();
        return updated_user.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    updatePost: async (_, { creds: { id, title, body, user_id } }) => {
      try {
        await admin
          .firestore()
          .doc(`posts/${id}`)
          .set({
            id: id,
            title: title,
            body: body,
            user_id: user_id
          });
        const updated_post = await admin
          .firestore()
          .doc(`posts/${id}`)
          .get();
        return updated_post.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    updateComment: async (_, { creds: { id, body, user_id, post_id } }) => {
      try {
        await admin
          .firestore()
          .doc(`comments/${id}`)
          .set({
            id: id,
            body: body,
            user_id: user_id,
            post_id: post_id
          });
        const updated_comment = await admin
          .firestore()
          .doc(`comments/${id}`)
          .get();
        return updated_comment.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        await admin
          .firestore()
          .doc(`users/${id}`)
          .delete();
        return {
          response: `User with ID: ${id} has been deleted. 💀`
        };
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    deletePost: async (_, { id }) => {
      try {
        await admin
          .firestore()
          .doc(`posts/${id}`)
          .delete();
        return {
          response: `Post with ID: ${id} has been deleted. 💀`
        };
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    deleteComment: async (_, { id }) => {
      try {
        await admin
          .firestore()
          .doc(`comments/${id}`)
          .delete();
        return {
          response: `Comment with ID: ${id} has been deleted. 💀`
        };
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

server.applyMiddleware({
  app,
  path: "/"
});

app.listen({ port: process.env.PORT }, () =>
  console.log(`🚀  Server ready on ${process.env.PORT}`)
);
