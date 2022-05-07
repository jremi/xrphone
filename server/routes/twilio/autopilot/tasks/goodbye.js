module.exports = (req, res) => {
  res.json({
    actions: [
      {
        say: "Thank you for using XRP Phone. Have a great day! Goodbye.",
      },
    ],
  });
};
