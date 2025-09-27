
class MiddlewareManager {
    constructor() {
        this.middlewares = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    async run(req, res, finalHandler) {
        let index = 0;
        
        const next = async (error) => {
            if (error) {
                throw error;
            }
            
            if (index >= this.middlewares.length) {
                if (finalHandler) {
                    return await Promise.resolve(finalHandler(req, res));
                }
                return;
            }
            
            const middleware = this.middlewares[index++];
            
            try {
                const result = middleware(req, res, next);
                if (result && typeof result.then === 'function') {
                    await result;
                }
            } catch (err) {
                throw err;
            }
        };
        
        await next();
    }
}

export default MiddlewareManager;