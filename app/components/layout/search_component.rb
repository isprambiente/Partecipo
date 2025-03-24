# frozen_string_literal: true

module Layout
  # this class render an events search panel
  class SearchComponent < CommonComponent
    # @param url [String]
    #   form destination url
    # @param turbo_frame [String]
    #   turbo_frame name to update
    # @param scope [String] (nil)
    #   optional, default: nil
    #   id or key to add as hidden_field
    #   in the form for scoped search
    # @param text [Boolean] (true)
    #   if true add text search input
    # @param date_range [Boolean] (true)
    #   if true add start_at and stop_at date input
    # @param categories [Array] ([])
    #   if present add a category select input
    # @param blank [Boolean] (true)
    #   if true add include_blank to category select
    # @param editor [Boolean] (false)
    #   if true make start_at not mandatory
    # @param soldout [Boolean] (false)
    #   if true add soldout select input
    def initialize(url:, turbo_frame:, text: true, date_range: true, scope: nil, blank: true, categories: [], editor: false, soldout: false, export: false, calendar: false)
      super
      @url = url
      @turbo_frame = turbo_frame
      @text = text
      @scope = scope
      @categories = categories
      @blank = blank
      @date_range = date_range
      @soldout = soldout
      @editor = editor
      @export = export
      @calendar = calendar
    end

    # make hash for include_blank
    # @return [Hash] if @blank is true return include_blank with the localize value
    # @return [Hash] if @blank is false, return an empty Hash
    def include_blank
      if @blank
        { include_blank: t(".all_category") }
      else
        {}
      end
    end
  end
end
