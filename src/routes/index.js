"use strict";

import express from "express";
import rakuten from "./rakuten/index.js";
import amazon from "./amazon/index.js";
import yahooShopping from "./yahooShopping/index.js";
import rakuma from "./rakuma/index.js";
import mercari from "./mercari/index.js";
import yahooAuction from "./yahooAuction/index.js";
const router = express.Router()



const getUrlRedirect = url => {
    const urlRedirect = [
        "rakuten/category",
        "rakuten/detail",
        "rakuten/search",
        "rakuma/category",
        "amazon/category",
        "amazon/detail",
        "yahoo-shopping/detail",
        'mercari/category',
        'yahoo-auction/detail',
    ]

    if (urlRedirect.includes(url)) {
        return "/" + url;
    }

    return false;
}

router.get("/", (req, res) => {
    res.send("Server is running!")
})

router.use((req, res, next) => {
    let parameter = req.query;
    let url = parameter.supplierval || '';
    let urlRediect = getUrlRedirect(url);

    if (urlRediect) {
        req.url = urlRediect;
        next();
    } else {
        const err = new Error('Not Found');
        err.statusCode = 404;
        next(err);
    }
})


router.use("/rakuten", rakuten)
router.use("/rakuma", rakuma)
router.use("/amazon", amazon)
router.use("/yahoo-shopping", yahooShopping)
router.use('/mercari', mercari);
router.use('/yahoo-auction', yahooAuction);

const handleError = (err, req, res, next) => {

    if (!(err instanceof Error)) {
        err = new Error(err);
        err.statusCode = 500;
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const stack = err.stack || '';

    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message,
        stack,
    });
}

router.use((err, req, res, next) => {
    handleError(err, req, res, next);
});


export default router