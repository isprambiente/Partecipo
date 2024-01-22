# frozen_string_literal: true

module Events
  # This class render the event information box
  class InfoboxComponent < CommonComponent
    # @param [Hash] opts
    #   to generate content
    # @option opts [Object] :event
    #   {Event} istance to render
    def initialize(event:, editor: false)
      super
      @event = event
      @editor = editor
    end

    # @return [String] html_safe events information box
    def call
      tag.div infobox + ribbon_tag + tag.hr(class: "hr") + @event.body.to_s, class: "box is-inactive has-ribbon block"
    end

    def ribbon_tag
        link_to icon('fas fa-edit'), edit_editor_event_path(@event), class: 'ribbon is-link' if @editor
    end

    def infobox
      ary = [
        [ t(".start_on"), (l(@event.start_on) if @event.start_on?) ],
        [ t(".stop_on"), (l(@event.stop_on) if @event.stop_on?) ],
        [ t(".tickets_frequency"), t(".#{@event.tickets_frequency}") ]
      ]
      level ary
    end
  end
end
