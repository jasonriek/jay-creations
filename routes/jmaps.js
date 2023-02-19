const basicAuth = require('express-basic-auth');

const JMAPS = {
    CONSCIOUSNESS: {map_name: 'consciousness', password: 'Radioman#25'},
    METAPHYSICS: {map_name: 'metaphysics', password: 'Radioman#25'},
    LYRIC_HEALTH: {map_name: 'lyric-health', password: 'Lyricman#25'},
    SAVOIE_SOUL_THEORY: {map_name: 'Savoie_Soul_Theory', password: 'Savoie101!'}
}

function usePassword(password) {
    return basicAuth({
        users: {admin: password},
        challenge: true // <--- needed to actually show the login dialog!
    });
}

function loadJMap(map_name) {
    function _loadJMap(req, res) {
        //let map_name = req.params.map_name;
        let context = {map_name: map_name};
        res.render('jmap_loaded', context);
    }
    return _loadJMap;
}

function selectJMap(app, key) {
    app.get(`/projects/jmap/${JMAPS[key].map_name}`, 
    usePassword(JMAPS[key].password),
    loadJMap(JMAPS[key].map_name));
}

module.exports = {
    selectJMap,
    JMAPS
}