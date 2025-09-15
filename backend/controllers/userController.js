const userService = require('../services/userService');

async function registerUser(req, res) {
  const { email, password, username } = req.body;
  try {
    const newUser = await userService.register({ email, password, username });
    res.status(201).json({ message: 'User registered', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || 'Registration error' });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const { token } = await userService.login({ email, password });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || 'Login error' });
  }
}

async function checkEmailExists(req, res) {
  const { email } = req.body;
  try {
    const exists = await userService.emailExists({ email });
    res.json({ exists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la vérification de l'email." });
  }
}

async function getProfile(req, res) {
  try {
    const user = await userService.getByIdPublic(req.userId);
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Cannot fetch profile' });
  }
}

async function updateProfile(req, res) {
  const { email, username, password } = req.body;
  try {
    const existing = await userService.findById(req.userId);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const updatedUser = await userService.updateProfileData(req.userId, { email, username, password });
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Update failed' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  checkEmailExists,
  getProfile,
  updateProfile,
}; 