# frozen_string_literal: true

require 'test_helper'

class GroupTest < ActiveSupport::TestCase
  test 'valid by factory' do
    assert build(:group).valid?
  end

  ### Associations

  test 'has many users' do
    g = create :group, users: [create(:user), create(:user)]
    assert_equal 2, g.users.count
  end

  test 'has many fact' do
    g = create :group
    create :fact, group: g
    create :fact, group: g
  end

  ### Validations
  test 'title is mandatory' do
    assert_not build(:group, title: nil).valid?
    assert build(:group, title: 'title').valid?
  end
end
