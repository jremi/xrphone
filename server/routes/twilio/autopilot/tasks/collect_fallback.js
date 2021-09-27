module.exports = (req, res) => {
  console.log("collect_fallback", JSON.stringify(req.body));
  res.json({
    actions: [
      {
        say: "collect fallback task!",
      },
      {
        listen: true,
      },
    ],
  });
};
