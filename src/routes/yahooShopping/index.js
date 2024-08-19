"use strict"

import express from "express";
import yahooShoppingController from "../../controllers/yahooShopping.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()

router.get("/detail", helper.asyncHandler(yahooShoppingController.GetProductDetail))
export default router