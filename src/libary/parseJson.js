
function parseJson(req, res, next) {
    res.send = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.nativeRes.end(JSON.stringify(data));
    }

    next();
}

export default parseJson;