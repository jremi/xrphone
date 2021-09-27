module.exports = (req, res) => {
  console.log("fallback", JSON.stringify(req.body));
  res.json({
    actions: [
      {
        say: "fallback task!",
      },
      {
        listen: true,
      },
    ],
  });
};
