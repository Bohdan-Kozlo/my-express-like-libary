
function parseJson(req, res) {
    res.send = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
    }
}

export default parseJson;