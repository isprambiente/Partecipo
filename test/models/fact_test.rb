# frozen_string_literal: true

require 'test_helper'

class FactTest < ActiveSupport::TestCase
  test 'valid from factory' do
    assert build(:fact).valid?
  end

  ### Associations
  test 'has many happenings' do
    f = create(:fact)
    create(:happening)
    create(:happening, fact: f)
    assert_equal 1, f.happenings.count
  end

  ### Validonions
  test 'title are required' do
    assert_not build(:fact, title: nil).valid?
  end
  test 'start_on are required' do
    assert_not build(:fact, start_on: nil).valid?
  end
  test 'stop_on are required' do
    assert_not build(:fact, stop_on: nil).valid?
  end

  ### scope
  test 'future scope' do
    create :fact, start_on: Time.zone.today - 2.days, stop_on: Time.zone.today - 1.day
    f2 = create :fact, start_on: Time.zone.today - 1.day, stop_on: Time.zone.today + 1.day
    f3 = create :fact, start_on: Time.zone.today + 2.days, stop_on: Time.zone.today + 3.days
    create :fact, start_on: Time.zone.today - 4.days, stop_on: Time.zone.today - 3.days

    assert_equal 2, Fact.future.count
    assert_equal f2, Fact.future.first
    assert_equal f3, Fact.future.last
    f3.update pinned: true
    assert_equal f3, Fact.future.first
  end
  test 'history scope' do
    f1 = create :fact, start_on: Time.zone.today - 2.days, stop_on: Time.zone.today - 1.day
    create :fact, start_on: Time.zone.today - 1.day, stop_on: Time.zone.today + 1.day
    create :fact, start_on: Time.zone.today + 2.days, stop_on: Time.zone.today + 3.days
    f4 = create :fact, start_on: Time.zone.today - 4.days, stop_on: Time.zone.today - 3.days
    assert_equal 2, Fact.history.count
    assert_equal f1, Fact.history.first
    assert_equal f4, Fact.history.last
  end
end
