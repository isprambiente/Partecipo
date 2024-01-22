# frozen_string_literal: true

module Layout
  # this class render an events search panel
  class SearchComponent < CommonComponent
    # @param [Hash] opts
    #   to generate content
    # @option [String] url
    #   url for send form
    # @option [string] turbo_frame
    #   turbo_frame name to update
    # @option [string] scope
    #   optional, default: nil
    #   id or key to add as hidden_field
    #   in the form for scoped search
    # @option opts [Array] :categories
    #   optional, default: []
    #   Array of selectable categories
    def initialize(url:, turbo_frame:, text: true, date_range: true, scope: nil, blank: true, categories: [])
      super
      @url = url
      @turbo_frame = turbo_frame
      @text = text
      @scope = scope
      @categories = categories
      @blank = blank
      @date_range = date_range
    end

    def include_blank
      if @blank
        {include_blank: t('.all_category') }
      else
        {}
      end
    end
  end
end
