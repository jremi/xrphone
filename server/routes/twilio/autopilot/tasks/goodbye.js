module.exports = (req, res) => {
  res.json({
    actions: [
      {
        say: "Thank you for using XRPhone. Have a great day! Goodbye.",
      },
    ],
  });
};
