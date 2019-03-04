import * as Events from "../event-reactions/types";
import Database from "object-to-file";
const db = new Database("funny-people");

type UserRanking = {
    user: string;
    points: number;
}
const rank: UserRanking[] = db.read("rank") ? db.read("rank") : [];


export function handleFunnyReaction(payload: Events.ReactionAdded) {
    const emoji = payload.reaction;
    const user = payload.item_user;

    let emojiValue = 0;

    switch(emoji) {
        case "gladsanders":
            emojiValue = 5;
            break;
        case "gladlip":
            emojiValue = 4;
            break;
        case "gladfven":
            emojiValue = 3;
            break;
        case "ehehe":
            emojiValue = 2;
            break;
        case "+1":
        case "uppdutt":
            emojiValue = 1;
            break;
        case "nerdutt":
        case "-1":
            emojiValue = -1;
            break;
    }

    if (emojiValue != 0)
        addPointsForUser(emojiValue, user);
}

function addPointsForUser(points: number, user: string) {
    var rankedUser = rank.find(x => x.user === user);
    if (rankedUser == null) {
        rank.push({user, points});
    } else {
        rankedUser.points += points;
    }
    db.push("rank", rank);
}


function sortByPoints(a: UserRanking, b: UserRanking): number {
    return a.points > b.points ? -1 : 1;
}

export function getFunniest() {
    return rank.sort(sortByPoints)[0];
}


export function getAllFunny() {
    return rank.sort(sortByPoints);
}