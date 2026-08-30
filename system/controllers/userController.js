// --- DEPENDENCIES ---
const sendGrid = require('../utils/sendGrid');
const catchAsync = require('../utils/catchAsync');

// --- MODELS ---

// --- UTILITIES ---

// --- CONTROLLER FUNCTIONS ---

// --- GENERATE PAGES ---
exports.sendEmail = catchAsync(async (req, res, next) => {
	const { name, email, subject, message } = req.body;

	const templateId = 'd-templatecode';
	const templateData = {
		subject: subject,
		email: email,
		name: name,
		message: message,
	};

	const mail = await sendGrid.contactEmail(templateId, templateData);

	if (mail === 'success') {
		sendGrid.addToMailingList(name, email);
		return res.status(200).json({ status: 'success' });
	}

	return res.json({ status: 'error' });
});
