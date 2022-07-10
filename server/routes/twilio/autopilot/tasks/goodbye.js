module.exports = (req, res) => {
  res.json({
    actions: [
      {
        say: "Thank you for using XR Phone. Have a great day! Goodbye.",
      },
    ],
  });
};
