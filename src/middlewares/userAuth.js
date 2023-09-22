import jwt from "jsonwebtoken";
export const access_token_secret = process.env.ACCESS_TOKEN_SECRET;

const userAuth = {};

userAuth.createAccessToken = (object, options) => {
    return jwt.sign(object, access_token_secret, options);
}

userAuth.checkJwt = (req, res, next) => {
    const token = req.headers["authorization"];
    try {
        jwt.verify(token, access_token_secret, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    status: "401",
                    result: err
                });
            } else if (decoded) {
                next();
            }
        });
    } catch (error) {
        return res.status(401).json({
            status: "401",
            result: "Unauthorized access"
        });
    }
};

export default userAuth;