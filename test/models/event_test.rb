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

  ### scope
end
