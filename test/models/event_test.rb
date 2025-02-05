# frozen_string_literal: true

require "test_helper"

# test fot {Event} model
class EventTest < ActiveSupport::TestCase
  test "valid from factory" do
    event = build :event
    assert event.valid?
    assert event.save
  end

  ### Relations
  test "belongs to group" do
    event = create :event
    assert_instance_of Group, event.group
  end

  test "has_many happenings" do
    event = create :event
    assert_instance_of Happening, event.happenings.new
  end

  ### Validations
  test "title are required" do
    assert_not build(:event, title: nil).valid?
  end

  ### scope searchable
  test "searchable from and to" do
    date = Date.today
    create :event, start_on: date, stop_on: date
    assert_equal 1, Event.searchable(from: date - 1).count
    assert_equal 1, Event.searchable(from: date).count
    assert_equal 0, Event.searchable(from: date + 1).count
    assert_equal 0, Event.searchable(to: date - 1).count
    assert_equal 1, Event.searchable(to: date).count
    assert_equal 1, Event.searchable(to: date + 1).count
  end

  test "searchable group_id" do
    event = create :event 
    assert_equal 0, Event.searchable(group_id: event.group_id + 1, editor: true).count
    assert_equal 1, Event.searchable(group_id: event.group_id, editor: true).count
  end
  
  test "searchable reserved" do
    create :event, reserved: true
    assert_equal 0, Event.searchable(editor: true).count
    assert_equal 1, Event.searchable(reserved: true, editor: true).count
  end

  test "searchable editor" do
    date = Date.today
    create :event, start_on: date, stop_on: date
    create :event
    assert_equal 1, Event.searchable(from: date).count
    assert_equal 2, Event.searchable(editor: true).count
  end

end
