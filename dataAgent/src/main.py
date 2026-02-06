from src.private_agent.agent import PrivateDataIngestionAgent
from src.public_agent.agent import PublicDataAgent
from src.merge_agent.agent import MergeAgent


def main():
    private_agent = PrivateDataIngestionAgent(
        input_dir="data/input",
        output_dir="data/output"
    )
    private_agent.run()

    public_agent = PublicDataAgent(
        company_name="Kalyani Forge Ltd",
        output_dir="data/output"
    )
    public_agent.run()

    merge_agent = MergeAgent("data/output")
    merge_agent.run()


if __name__ == "__main__":
    main()
