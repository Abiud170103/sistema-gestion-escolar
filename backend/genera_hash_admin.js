const bcrypt = require('bcryptjs');

(async () => {
  const hash = await bcrypt.hash('admin456', 10);
  console.log('Hash para admin456:', hash);
})();
