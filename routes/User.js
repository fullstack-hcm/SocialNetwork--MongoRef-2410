let express = require('express');
let route   = express.Router();
let { USER_MODEL } = require('../models/User');
let ObjectID       = require('mongoose').Types.ObjectId;
route.route('/add-user')
    .get((req, res) => {
        res.render('add-user');
    })
    .post(async (req, res) => {
        let { username, email } = req.body;

        let infoUserForInsert = new USER_MODEL({ username, email });
        let infoUserAfterInserted = await infoUserForInsert.save();

        if (!infoUserAfterInserted)
            res.json({ error: true, message: 'cannot_insert_user' });
        // res.json({ error: false, data: infoUserAfterInserted })
        res.redirect('/user/login');
    });

route.route('/login')
    .get((req, res) => {
        res.render('login')
    })
    .post(async (req, res) => {
        let { username } = req.body;
        let isExist = await USER_MODEL.findOne({ username });
        if (!isExist)
            return res.json({ error: true, message: 'user_in_exists' });
        
        req.session.infoUser = isExist; //obj
        res.redirect('/user/home');
    })

route.get('/home', async (req, res) => {
    let { infoUser } = req.session;
    if (!infoUser) res.redirect('/user/login');


    let { _id: userID } = infoUser;

    let infoUserNew = await USER_MODEL.findById(userID)
        .populate('usersRequest')
        .populate('friends')
    
    let arrIDExcept = [...infoUserNew.usersRequest, userID, ...infoUserNew.friends];

    // arrIDExcept = arrIDExcept.map(item => ObjectID(item))
    // console.log({ arrIDExcept })

    let listUsers = await USER_MODEL.find({
        // _id: { $ne: userID },
        _id: {
            $nin: arrIDExcept
        }
    });

    if (!Array.isArray(listUsers))
        res.json({ error: true, message: 'cannot_get_list' });
    res.render('home', {
        listUsers, infoUser: infoUserNew
    });
});

route.get('/add-friend/:userReceiveID', async (req, res) => {
    let { userReceiveID } = req.params;
    // CHECK ISVALID_ID
    let { infoUser: { _id: userSendID } } = req.session;

    let infoUserSendAfterUpdate = await USER_MODEL.findByIdAndUpdate(userSendID, {
        $addToSet: { 
            guestsRequest: userReceiveID
        }
    }, { new: true });

    let infoUserReceiveAfterUpdate = await USER_MODEL.findByIdAndUpdate(userReceiveID, {
        $addToSet: { 
            usersRequest: userSendID
        }
    }, { new: true });

    console.log({ infoUserSendAfterUpdate, infoUserReceiveAfterUpdate })

    if (!infoUserSendAfterUpdate || !infoUserReceiveAfterUpdate)
        res.json({ error: true, message: 'cannot_add_friend' });

    res.redirect('/user/home');
})

route.get(`/accept-request-add-friend/:userReceiveID`, async (req, res) => {
    let { userReceiveID } = req.params;
    // CHECK ISVALID_ID
    let { infoUser: { _id: userSendID } } = req.session;

    let infoUserSendAfterUpdate = await USER_MODEL.findByIdAndUpdate(userSendID, {
        $pull: {
            usersRequest: userReceiveID
        },
        $addToSet: {
            friends: userReceiveID
        }
    }, { new: true });
   
    let infoUserReceiveAfterUpdate = await USER_MODEL.findByIdAndUpdate(userReceiveID, {
        $pull: {
            guestsRequest: userSendID
        },
        $addToSet: {
            friends: userSendID
        }
    }, { new: true });

    if (!infoUserSendAfterUpdate || !infoUserReceiveAfterUpdate)
        res.json({ error: true, message: 'cannot_accept_request_friend' });

    res.redirect('/user/home');
})

route.get('/remove-request-friend/:userReceiveID', async (req, res) => {
    let { userReceiveID } = req.params;
    // CHECK ISVALID_ID
    let { infoUser: { _id: userSendID } } = req.session;

    let infoUserSendAfterUpdate = await USER_MODEL.findByIdAndUpdate(userSendID, {
        $pull: {
            guestsRequest: userReceiveID
        }
    });

    let infoUserReceiveAfterUpdate = await USER_MODEL.findByIdAndUpdate(userReceiveID, {
        $pull: {
            usersRequest: userSendID
        }
    });

    res.redirect('/user/home');
})

exports.USER_ROUTE = route;