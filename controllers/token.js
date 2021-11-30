const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET =
	'68b80419a287d4b82163317ef7115ce001d8a91cfe534f78fbd8ba33420210b3f9950d9625f32666753ca962c8781ae759be92e72b03580c39a809b2273b60c4';

const REFRESH_TOKEN_SECRET =
	'892c84a4d62f610f70081249502e4683d96230e3b8dd4330e08f492edf9d349d77e6e2de376c668d88d6ecdaebd79c593031b0dc27e1ff962f5f00d8860f9021';

const createAccessToken = (user) => {
	return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
};

const createRefreshToken = (user) => {
	return jwt.sign(user, REFRESH_TOKEN_SECRET);
};

const validateToken = (token) => {
	try {
		return jwt.verify(token, ACCESS_TOKEN_SECRET) ? true : false;
	} catch {
		return false;
	}
};

module.exports = { createAccessToken, createRefreshToken, validateToken };
