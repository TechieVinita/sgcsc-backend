const Gallery = require('../models/Gallery');

exports.getAffiliations = async (req, res) => {
  const items = await Gallery.find({ category: 'affiliation' })
    .sort({ createdAt: -1 })
    .lean();

  res.json(items.map(i => ({
    id: i._id,
    name: i.title,
    img: i.image,
    subtitle: i.altText || '',
    link: i.image,
  })));
};
