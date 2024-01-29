# frozen_string_literal: true

module Happenings
  # this class render an happening component for an happenings list
  class HappeningComponent < CommonComponent
    # @param [Hash] opt, turbo_frame: @turbo_frames
    #   to generate content
    # @option opts [Array] :happening
    #   happening to render
    def initialize(happening:, turbo_frame: "happenings", url: :happening_path)
      @happening = happening
      @turbo_frame = turbo_frame
      @url = url
    end
  end
end
