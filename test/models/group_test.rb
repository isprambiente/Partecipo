# frozen_string_literal: true

require "test_helper"

# test for {Group} model
class GroupTest < ActiveSupport::TestCase
  test "valid by factory" do
    group = build :group
    assert group.valid?
    assert group.save
  end

  ### Relations
  test "has many users" do
    group = create :group
    assert_instance_of User, group.users.new
  end

  test "has many events" do
    group = create :group
    assert_instance_of Event, group.events.new
  end

  ### Validations
  test "title is mandatory" do
    group = build(:group, title: nil)
    assert_not group.valid?
    group.title = "test"
    assert group.valid?
    assert group.save
  end
end
