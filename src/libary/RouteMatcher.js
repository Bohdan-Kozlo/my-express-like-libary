class RouteMatcher {
     constructor(path) {
        this.path = path;
        this.paramNames = [];

        const regexPath = path.replace(/:([^/]+)/g, (_, key) => {
            this.paramNames.push(key);
            return "([^/]+)";
        });

        this.regex = new RegExp(`^${regexPath}$`);
    }

    match(urlPath) {
        const match = urlPath.match(this.regex);
        if (!match) return null;

        const params = {};
        this.paramNames.forEach((name, i) => {
            params[name] = decodeURIComponent(match[i + 1]);
        });

        return params;
    }
}

export default RouteMatcher;