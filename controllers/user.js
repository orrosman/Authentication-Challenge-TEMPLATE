const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

module.exports = router;
