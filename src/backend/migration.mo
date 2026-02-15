import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    associateId : Text;
    email : Text;
    joinDate : Int;
    name : Text;
    phone : Text;
    referralCode : Text;
    referredBy : ?Principal;
    status : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    associateId : Text;
    email : Text;
    joinDate : Int;
    name : Text;
    phone : Text;
    referralCode : Text;
    referredBy : ?Principal;
    referredByAssociateId : ?Text;
    status : Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) { { oldProfile with referredByAssociateId = null } }
    );

    { userProfiles = newUserProfiles };
  };
};
