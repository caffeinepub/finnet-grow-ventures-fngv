import Text "mo:core/Text";

module {
  public let EMPTY_TEXT = "";

  public func isEmpty(text : Text) : Bool {
    text == EMPTY_TEXT;
  };
};
