import * as Events from "../event-reactions/types";
import Database from "object-to-file";
const funnyDb = new Database("funny-people");
const agreeableDb = new Database("agreeable-people");

type UserRanking = {
    user: string;
    points: number;
}
const funnyRank: UserRanking[] = funnyDb.read("rank") ? funnyDb.read("rank") : [];
const agreeableRank: UserRanking[] = agreeableDb.read("rank") ? agreeableDb.read("rank") : [];


export function handlePointsForReaction(payload: Events.ReactionAdded, remove = false) {
    const user = payload.item_user;
    const reacter = payload.user;
    
    if (user === reacter)
        return;

    handleFunnyReaction(payload, user, remove);
    handleAgreeableReaction(payload, user, remove);
}

function handleFunnyReaction(payload: Events.ReactionAdded, user: string, remove: boolean) {
    let emojiValue = 0;

    if (payload.reaction.startsWith("glad")) {
        emojiValue = 1;
    }

    if (emojiValue != 0) {
        if (remove)
            emojiValue *= -1;

        addPointsForUser(funnyDb, funnyRank, emojiValue, user);
    }   
}

function handleAgreeableReaction(payload: Events.ReactionAdded, user: string, remove: boolean) {
    let emojiValue = 0;

    switch (payload.reaction) {
        case "+1":
        case "thumbsup":
        case "uppdutt":
        case "+":
        case "++":
        case "heavy_plus_sign":
        case "point_up":
        case "point_up2":
        case "arrow_up":
        case "ok_hand":
        case "heavy_check_mark":
        case "white_check_mark":
        case "pogchamp":
        case "brain3":
        case "brain4":
        case "brain":
        case "fire":
            emojiValue = 1;
            break;
        case "-1":
        case "nerdutt":
        case "disagree":
        case "disagree2":
        case "thumbsdown":
        case "face_with_one_eyebrow_raised":
        case "face_with_raised_eyebrow":
        case "costanza1":
        case "costanza2":
        case "ishygddt":
        case "ishygddt2":
        case "fu":
        case "middle_finger":
        case "reversed_hand_with_middle_finger_extended":
        case "brain1":
            emojiValue = -1;
            break;
    }

    if (emojiValue != 0) {
        if (remove)
            emojiValue *= -1;

        addPointsForUser(agreeableDb, agreeableRank, emojiValue, user);
    }   
}

function addPointsForUser(db: Database, rankList: UserRanking[], points: number, user: string) {
    var rankedUser = rankList.find(x => x.user === user);
    if (rankedUser == null) {
        rankList.push({user, points});
    } else {
        rankedUser.points += points;
    }
    db.push("rank", rankList);
}


function sortByPoints(a: UserRanking, b: UserRanking): number {
    return a.points > b.points ? -1 : 1;
}

export function getFunniest() {
    return getAllFunny()[0];
}

export function getAllFunny() {
    return funnyRank.sort(sortByPoints);
}

export function getMostAgreeable() {
    return getAllAgreeable()[0];
}

export function getAllAgreeable() {
    return agreeableRank.sort(sortByPoints);
}