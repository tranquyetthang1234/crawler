"use strict"

import express from "express";
import rakutenFashionController from "../../controllers/rakutenFashion.controller.js";
import helper from "../../helpers/index.js";

const router = express.Router()


router.get("/detail", helper.asyncHandler(rakutenFashionController.getInfoDetail))

export default router