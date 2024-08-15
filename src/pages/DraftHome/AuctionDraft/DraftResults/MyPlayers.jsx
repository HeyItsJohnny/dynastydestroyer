import React, { useState, useEffect } from "react";

import DraftedPlayerComponent from "./DraftedPlayerComponent";

//Firebase
import { db } from "../../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";

const MyPlayers = () => {
  //player data
  const [draftedPlayers, setDraftedPlayers] = useState({
    QB: [],
    RB: [],
    WR: [],
    TE: [],
  });

  const fetchDraftedPlayers = async (position, setter) => {
    const docCollection = query(
      collection(db, "auctiondraft", "players", position),
      where("DraftStatus", "==", "Drafted"),
      orderBy("CurrentAuctionRank")
    );

    onSnapshot(docCollection, (querySnapshot) => {
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        AuctionRank: doc.data().AuctionRank,
        CurrentAuctionRank: doc.data().CurrentAuctionRank,
        Age: doc.data().Age,
        College: doc.data().College,
        DepthChartOrder: doc.data().DepthChartOrder,
        FullName: doc.data().FullName,
        InjuryNotes: doc.data().InjuryNotes,
        InjuryStatus: doc.data().InjuryStatus,
        KeepTradeCutIdentifier: doc.data().KeepTradeCutIdentifier,
        NonSuperFlexValue: doc.data().NonSuperFlexValue,
        Position: doc.data().Position,
        SleeperID: doc.data().SleeperID,
        SearchRank: doc.data().SearchRank,
        Status: doc.data().Status,
        SuperFlexValue: doc.data().SuperFlexValue,
        Team: doc.data().Team,
        YearsExperience: doc.data().YearsExperience,
        FantasyPointsAgainst: doc.data().FantasyPointsAgainst,
        Fumbles: doc.data().Fumbles,
        PassingINT: doc.data().PassingINT,
        PassingTD: doc.data().PassingTD,
        PassingYDS: doc.data().PassingYDS,
        Rank: doc.data().Rank,
        ReceivingRec: doc.data().ReceivingRec,
        ReceivingTD: doc.data().ReceivingTD,
        ReceivingYDS: doc.data().ReceivingYDS,
        ReceptionPercentage: doc.data().ReceptionPercentage,
        RushingTD: doc.data().RushingTD,
        RushingYDS: doc.data().RushingYDS,
        RedzoneGoalToGo: doc.data().RedzoneGoalToGo,
        RedzoneTargets: doc.data().RedzoneTargets,
        RedZoneTouches: doc.data().RedZoneTouches,
        ReceivingTargets: doc.data().ReceivingTargets,
        TargetsReceiptions: doc.data().TargetsReceiptions,
        TotalPoints: doc.data().TotalPoints,
        TotalCarries: doc.data().TotalCarries,
        TotalTouches: doc.data().TotalTouches,
        WeeklyPoints: doc.data().WeeklyPoints,
      }));
      setter((prevState) => ({ ...prevState, [position]: list }));
    });
  };


  useEffect(() => {
    fetchDraftedPlayers("QB", setDraftedPlayers);
    fetchDraftedPlayers("RB", setDraftedPlayers);
    fetchDraftedPlayers("WR", setDraftedPlayers);
    fetchDraftedPlayers("TE", setDraftedPlayers);

    return () => {
      setDraftedPlayers({
        QB: [],
        RB: [],
        WR: [],
        TE: [],
      });
    };
  }, []);

  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
      <PositionSection title="Quarterbacks" players={draftedPlayers.QB}/>
      <PositionSection title="Runningbacks" players={draftedPlayers.RB}/>
      <PositionSection title="Wide Receivers" players={draftedPlayers.WR}/>
      <PositionSection title="Tight Ends" players={draftedPlayers.TE}/>
    </div>
  );
};

const PositionSection = ({ title, players}) => (
  <div>
    <div className="flex justify-between items-center gap-2 mt-5">
      <p className="text-xl font-semibold">{title}</p>
    </div>
    <div className="mt-5 w-72 md:w-400">
      
      {players.length > 0 ? (
        players.map((player) => <DraftedPlayerComponent playerData={player}/>)
      ) : (
        <p>No drafted players available.</p>
      )}
    </div>
  </div>
);

export default MyPlayers;
