const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const tokens = require('./token');

const USERS = [];
const INFORMATION = [];
const REFRESHTOKENS = [];

router.post('/users/register', async (req, res) => {
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

router.post('/users/login', async (req, res) => {
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

router.post('/users/tokenValidate', (req, res) => {
	try {
		const token = req.headers['authorization'].split(' ')[1];

		if (tokens.validateToken(token)) {
			res.status(200).send({
				valid: true,
			});
		} else {
			res.status(403).send({
				message: 'Invalid Access Token',
			});
		}
	} catch {
		res.status(401).send({
			message: 'Access Token Required',
		});
	}
});

router.post('/users/token', (req, res) => {
	try {
		const { token } = req.body;
		const refreshToken = REFRESHTOKENS.find(
			(refreshToken) => refreshToken === token
		);

		if (refreshToken) {
			const userInfo = tokens.validateToken(token, 'refresh');
			delete userInfo.iat;
			const newAccessToken = tokens.createAccessToken(userInfo);

			res.status(200).send(newAccessToken);
		} else {
			res.status(403).send({
				message: 'Invalid Refresh Token',
			});
		}
	} catch {
		res.status(401).send({
			message: 'Refresh Token Required',
		});
	}
});

router.post('/users/logout', (req, res) => {
	try {
		const { token } = req.body;
		const tokenIndex = REFRESHTOKENS.indexOf(token);

		if (tokenIndex >= 0) {
			REFRESHTOKENS.splice(tokenIndex, 1);
			res.status(200).send('User Logged Out Successfully');
		} else {
			res.status(400).send('Invalid Refresh Token');
		}
	} catch {
		res.status(400).send('Refresh Token Required');
	}
});

router.get('/api/v1/information', (req, res) => {
	try {
		const token = req.headers['authorization'].split(' ')[1];
		const tokenInfo = tokens.validateToken(token);

		if (tokenInfo) {
			const userInfo = INFORMATION.find(
				(user) => user.email === tokenInfo.email
			);
			res.status(200).send(userInfo);
		} else {
			res.status(403).send({
				message: 'Invalid Access Token',
			});
		}
	} catch {
		res.status(401).send({
			message: 'Access Token Required',
		});
	}
});

router.get('/api/v1/users', (req, res) => {
	try {
		const token = req.headers['authorization'].split(' ')[1];
		const tokenInfo = tokens.validateToken(token);

		if (tokenInfo.isAdmin) {
			res.status(200).send(USERS);
		} else {
			res.status(403).send({
				message: 'Invalid Access Token',
			});
		}
	} catch {
		res.status(401).send({
			message: 'Access Token Required',
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

const addAdminUser = async () => {
	const adminUser = await createUserObject(
		'admin@email.com',
		'admin',
		'Rc123456!',
		true
	);

	USERS.push(adminUser);
};

addAdminUser();

module.exports = router;
