// Dependencies
const sgClient = require('@sendgrid/client');
const sgMail = require('@sendgrid/mail');

// Add necessary API keys
sgClient.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send emails from a contact form
 * @param {string} templateId Mailing template string from SendGrid
 * @param {JSON} templateData Data to be used with the template
 * @returns {string} Either "error" or "success"
 */
exports.contactEmail = async (templateId, templateData) => {
	const msg = {
		to: {
			email: process.env.EMAIL_REPLY_TO,
			name: 'Support',
		},
		from: {
			email: process.env.EMAIL_FROM,
			name: 'System',
		},
		reply_to: {
			email: templateData.email,
			name: templateData.name,
		},
		templateId: templateId,
		dynamic_template_data: templateData,
		mail_settings: {
			bypass_spam_management: {
				enable: true,
			},
		},
	};

	sgMail.send(msg).catch((err) => {
		// eslint-disable-next-line no-console
		console.log(err);
		return 'error';
	});
	return 'success';
};

/**
 * Template to easily send emails from anywhere in the system
 * @param {string} templateId Mailing template string from SendGrid
 * @param {JSON} user User from the database
 * @param {JSON} templateData Data to be used with template
 * @returns {string} Either "error" or "success"
 */
exports.sendEmail = async (templateId, user, templateData) => {
	const msg = {
		to: {
			email: user.email,
			name: `${user.firstName} ${user.lastName}`,
		},
		from: {
			email: process.env.EMAIL_FROM,
			name: 'NodeJs Template',
		},
		reply_to: {
			email: process.env.EMAIL_REPLY_TO,
			name: 'NodeJs Template Support',
		},
		templateId: templateId,
		dynamic_template_data: templateData,
		asm: { group_id: 17345 },
		mail_settings: {
			bypass_spam_management: {
				enable: true,
			},
		},
	};

	sgMail.send(msg).catch((err) => {
		// eslint-disable-next-line no-console
		console.log(err);
		return 'error';
	});
	return 'success';
};

/**
 * Add users to mailing lists
 * @param {string} name Name of the user
 * @param {string} email Email of the user
 * @returns {string} Either "error" or "success"
 */
exports.addToMailingList = async (name, email) => {
	const options = {
		method: 'PUT',
		url: '/v3/marketing/contacts',
		body: {
			list_ids: ['73ddedc7-f736-4027-a456-a62ba3ad91cc'],
			contacts: [
				{
					first_name: name,
					email: email,
				},
			],
		},
	};

	sgClient.request(options).catch((err) => {
		// eslint-disable-next-line no-console
		console.log(err.response.body);
		return 'error';
	});
	return 'success';
};

/**
 * Add user to contacts
 * @param {JSON} user User from the database
 * @returns {string} Either "error" or "success"
 */
exports.addToContacts = async (user) => {
	const options = {
		method: 'PUT',
		url: '/v3/marketing/contacts',
		body: {
			list_ids: ['96b8cdcb-1085-4402-ad5c-ec88a69be3d6'],
			contacts: [
				{
					first_name: user.firstName,
					last_name: user.lastName,
					email: user.email,
				},
			],
		},
	};

	sgClient.request(options).catch((err) => {
		// eslint-disable-next-line no-console
		console.log(err.response.body);
		return 'error';
	});
	return 'success';
};
