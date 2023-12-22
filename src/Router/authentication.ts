/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 */

import express from "express";
import {
  forgetPassword,
  login,
  register,
  registerCreator,
  updatePassword,
} from "../Controllers/authentication";
import { authenticateToken } from "../Middleware";

export default (router: express.Router) => {
  /**
   * @openapi
   * /v1/vidmo/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserRegistration'
   *     responses:
   *       200:
   *         description: User registered successfully
   *       400:
   *         description: Bad request
   *       409:
   *         description: User already exists
   */
  router.post("/auth/register", register);

  /**
   * @openapi
   * /v1/vidmo/auth/login:
   *   post:
   *     summary: Log in as a user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserLogin'
   *     responses:
   *       200:
   *         description: User logged in successfully
   *       401:
   *         description: Unauthorized - Invalid credentials
   */
  router.post("/auth/login", login);

  /**
   * @openapi
   * /v1/vidmo/auth/forgetPassword:
   *   post:
   *     summary: Request password reset
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgetPasswordRequest'
   *     responses:
   *       200:
   *         description: Password reset email sent successfully
   *       404:
   *         description: User not found
   */
  router.post("/auth/forgetPassword", forgetPassword);

  /**
   * @openapi
   * /v1/vidmo/auth/updatePassword:
   *   post:
   *     summary: Update user password
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePasswordRequest'
   *     responses:
   *       200:
   *         description: Password updated successfully
   *       401:
   *         description: Unauthorized - Invalid or expired token
   */
  router.post("/auth/updatePassword", authenticateToken, updatePassword);

  /**
   * @openapi
   * /v1/vidmo/auth/register/creator:
   *   get:
   *     summary: Register as a creator
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Creator registration successful
   *       401:
   *         description: Unauthorized - Invalid or expired token
   */
  router.get("/auth/register/creator", registerCreator);
};
