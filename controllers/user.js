const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const tokens = require('./token');

const USERS = [];
const INFORMATION = [];
const REFRESHTOKENS = [];

router.post('/register', async (req, res) => {
	const { email, user, password } = req.body;
	if (USERS.some((user) => user.email === email)) {
		res.status(409).send({
			message: 'user already exists',
		});
	} else {
		const newUser = await createUserObject(email, user, password);

		USERS.push(newUser);
		INFORMATION.push({ email: email, info: `${user} info` });

		res.status(201).send({
			message: 'Register Success',
		});
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (USERS.some((user) => user.email === email)) {
		const user = USERS.find((user) => user.email === email);
		if (await decryptPassword(password, user.password)) {
			const accessToken = tokens.createAccessToken(user);
			const refreshToken = tokens.createRefreshToken(user);

			REFRESHTOKENS.push(refreshToken);

			const { name, isAdmin } = user;

			res.status(200).send({
				accessToken,
				refreshToken,
				email,
				name,
				isAdmin,
			});
		} else {
			res.status(403).send({
				message: 'User or Password incorrect',
			});
		}
	} else {
		res.status(404).send({
			message: 'cannot find user',
		});
	}
});

const createUserObject = async (email, name, password, isAdmin = false) => {
	const hashedPassword = await encryptPassword(password);
	const newUser = {
		email: email,
		name: name,
		password: hashedPassword,
		isAdmin: isAdmin,
	};
	return newUser;
};

const encryptPassword = async (password) => {
	return await bcrypt.hash(password, saltRounds);
};

const decryptPassword = async (password, hashedPassword) => {
	return await bcrypt.compare(password, hashedPassword);
};

module.exports = router;
