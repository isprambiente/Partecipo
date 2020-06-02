# frozen_string_literal: true

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'valid from factory' do
    assert build(:user).valid?
  end

  ### Assoviations
  test 'has many tickets' do
    u = create :user
    create :ticket, user: u
    create :ticket, user: u
    assert_equal 2, u.tickets.count
  end

  test 'has many group' do
    u = create :user, groups: [create(:group), create(:group)]
    assert_equal 2, u.groups.count
  end

  test 'has many facts' do
    g1 = create :group
    g2 = create :group
    u = create :user, groups: [g1, g2]
    create :fact, group: g1
    create :fact, group: g2
    assert_equal 2, u.facts.count
  end

  ### Validations
  test 'username is required' do
    assert_not build(:user, username: nil).valid?
  end
end
