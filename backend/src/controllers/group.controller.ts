import Group from "../models/group.model";

export const createGroup = async (req: any, res: any) => {
  try {
    const { name, members } = req.body; // members ek array hona chahiye IDs ka
    const adminId = req.user._id;

    // Check karein ki admin pehle se members list mein toh nahi hai
    const uniqueMembers = Array.from(new Set([...members, adminId.toString()]));

    const newGroup = new Group({
      name,
      admin: adminId,
      members: uniqueMembers, // Sirf selected log + admin
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: "Error creating group" });
  }
};

export const getGroups = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    // Sirf wahi groups fetch karein jisme user member hai
    const groups = await Group.find({ members: { $in: [userId] } }).populate("members", "-password");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};