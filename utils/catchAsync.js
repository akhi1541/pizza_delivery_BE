module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //*you can do it as above line but this is a short hand
  };
};
