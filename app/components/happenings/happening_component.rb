# frozen_string_literal: true

module Happenings
  # this class render an happening component for an happenings list
  class HappeningComponent < CommonComponent
    # @param happening [Object] istance of {Happening}
    # @param turbo_frame [String] ("happenings") id of turbo_frame generated
    # @param url [Simbol] (:happening_path) method to generate link
    def initialize(happening:, turbo_frame: "happenings", url: :happening_path)
      @happening = happening
      @turbo_frame = turbo_frame
      @url = url
    end
  end
end
