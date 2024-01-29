# frozen_string_literal: true

module Events
  # this class render an event component for an events list
  class EventComponent < CommonComponent
    # @param [Hash] opts
    #   to generate content
    # @option opts [Array] :event
    #   event to render
    def initialize(event:, url: :event_path)
      @event = event
      @url = url
    end

    # @return [String] html_safe div.list-item-description
    def list_item_content
      title = tag.div icon_text("fas fa-calendar", @event.title), class: "list-item-title"

      tag.div title + description, class: "list-item-content"
    end

    def description
      cal = tag.div(icon_text("fas fa-calendar-day", @event.happenings_count), class: "tag")
      cat = tag.div(icon_text("fas fa-list", @event.group.title), class: "tag")
      tag.div date + cal + cat, class: "list-item-description"
    end

    def date
      if @event.stop_on?
        if @event.single == true
          l(@event.stop_on)
        else
          "#{ t '.from' } #{ l @event.start_on } #{ t '.to'} #{l @event.stop_on }"
        end
      else
        "-"
      end
    end
  end
end
