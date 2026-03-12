const login = async (req, res) => {

  const { email } = req.body;

  const allowedDomains = /@(acet|aec|aus)\.ac\.in$/;

  if (!allowedDomains.test(email)) {
    return res.status(403).json({
      message: "Login allowed only with college email"
    });
  }

  // continue login logic
};